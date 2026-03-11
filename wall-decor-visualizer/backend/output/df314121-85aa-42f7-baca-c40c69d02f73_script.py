OUTPUT_PATH = '/tmp/df314121-85aa-42f7-baca-c40c69d02f73.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions:
    - Total Wall Height: 9'
    - Total Wall Width: 14'6" (7' for the opening section + 7'6" for the solid section)
    - Opening Width: 7'
    - Opening Height: 8'
    - Gap above opening: 1' (consistent with 9' total height)
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions (using 1 unit = 1 foot)
    wall_width = 14.5  # 7' + 7.5'
    wall_height = 9.0
    wall_thickness = 0.5  # Standard assumed thickness
    
    opening_width = 7.0
    opening_height = 8.0
    
    # 1. Create the Main Wall
    # We position the wall so its bottom-left corner is at the origin (0,0,0)
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall_Boundary"
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Cutter)
    # The opening is located on the left side of the wall, starting from the floor
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    # Scale the cutter (slightly thicker on Y to ensure a clean boolean cut)
    cutter.scale = (opening_width, wall_thickness * 2, opening_height)
    cutter.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Apply Boolean Difference to create the opening in the wall
    bool_mod = wall.modifiers.new(name="Door_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Set wall as active and apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the cutter object from the scene
    bpy.data.objects.remove(cutter, do_unlink=True)

    # 5. Export the result to GLB format
    # use_selection=False ensures the entire scene (the wall) is exported
    export_path = "wall_skeleton.glb"
    bpy.ops.export_scene.gltf(
        filepath=export_path, 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()