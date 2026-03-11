OUTPUT_PATH = '/tmp/fdc3f8ca-df17-404b-8d32-dab5bfa66a27.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    - Total Wall Width: 14'6" (7' + 7'6")
    - Total Wall Height: 9'
    - Door Opening: 7' wide by 8' high, located at the bottom left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters (Blender default unit)
    FT_TO_M = 0.3048

    # Dimensions derived from image analysis
    wall_width_ft = 14.5  # 7' + 7.5'
    wall_height_ft = 9.0
    wall_depth_ft = 0.5   # Assumed standard wall thickness
    
    door_width_ft = 7.0
    door_height_ft = 8.0

    # Convert to meters
    w_w = wall_width_ft * FT_TO_M
    w_h = wall_height_ft * FT_TO_M
    w_d = wall_depth_ft * FT_TO_M
    
    d_w = door_width_ft * FT_TO_M
    d_h = door_height_ft * FT_TO_M

    # 1. Create the Main Wall
    # Center location is half of each dimension to place the corner at (0,0,0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(w_w/2, w_d/2, w_h/2))
    wall = bpy.context.active_object
    wall.name = "MainWall"
    wall.scale = (w_w, w_d, w_h)
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

    # 2. Create the Door Opening Cutter
    # Positioned at the bottom-left of the wall
    bpy.ops.mesh.primitive_cube_add(size=1, location=(d_w/2, w_d/2, d_h/2))
    cutter = bpy.context.active_object
    cutter.name = "DoorCutter"
    # Scale cutter slightly deeper than the wall to ensure a clean boolean cut
    cutter.scale = (d_w, w_d * 1.1, d_h)
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

    # 3. Apply Boolean Modifier to create the opening
    bool_mod = wall.modifiers.new(name="DoorOpening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Set active object to wall and apply modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up: Remove the cutter object
    bpy.data.objects.remove(cutter, do_unlink=True)

    # Export to GLB format
    bpy.ops.export_scene.gltf(
        filepath='/tmp/fdc3f8ca-df17-404b-8d32-dab5bfa66a27.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function
create_wall_skeleton()