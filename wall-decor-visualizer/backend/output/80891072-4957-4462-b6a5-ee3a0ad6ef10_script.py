OUTPUT_PATH = '/tmp/80891072-4957-4462-b6a5-ee3a0ad6ef10.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Wall Height: 9'
    - Total Wall Width: 14'6" (7' left section + 7'6" right section)
    - Opening Width: 7'
    - Opening Height: 8'
    - Top Beam Height: 1'
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Define dimensions (1 unit = 1 foot)
    wall_width = 14.5  # 7' + 7.5'
    wall_height = 9.0
    wall_thickness = 0.5
    
    opening_width = 7.0
    opening_height = 8.0
    
    # Create the Main Wall block
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    # Position origin at bottom-left corner (0,0,0)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Create the Opening block (Door/AC area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Opening_Cutout"
    # Make it slightly thicker to ensure clean boolean cut
    opening.scale = (opening_width, wall_thickness * 2, opening_height)
    # Positioned at the bottom left
    opening.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Apply Boolean modifier to the wall to create the opening
    bool_mod = wall.modifiers.new(name="Opening_Subtraction", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    # Set wall as active and apply modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # Remove the helper opening object
    bpy.data.objects.remove(opening, do_unlink=True)

    # Export the result to GLB format
    # The file will be saved in the current working directory
    export_path = "wall_skeleton.glb"
    bpy.ops.export_scene.gltf(
        filepath=export_path, 
        export_format='GLB', 
        use_selection=False
    )
    
    print(f"Wall skeleton exported to {export_path}")

# Execute the function directly
create_wall_skeleton()